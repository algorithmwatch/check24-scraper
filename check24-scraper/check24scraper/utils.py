from functools import lru_cache
import gzip
import random

from bs4 import BeautifulSoup
from requests import Session
from requests_cache import CachedSession, SerializerPipeline, Stage, pickle_serializer
from retry_requests import retry



def make_session():
    """ """
    # if "CACHE" in os.environ:

    compressed_serializer = SerializerPipeline(
        [
            pickle_serializer,
            Stage(dumps=gzip.compress, loads=gzip.decompress),
        ],
        is_binary=True,
    )

    session = CachedSession(
        backend="sqlite",
        cache_name="httpcache",
        expire_after=60 * 60 * 24 * 31,
        cache_control=False,
        allowable_codes=[200, 404],
        serializer=compressed_serializer,
    )
    # else:
    #     session = Session()

    session.headers.update(
        {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:98.0) Gecko/20100101 Firefox/98.0"
        }
    )
    return retry(session, retries=5, backoff_factor=0.2)


session = make_session()

@lru_cache
def get_proxies():
    all_servers = session.get("https://api.mullvad.net/www/relays/all/").json()
    return [
        f"socks5://{x['socks_name']}.mullvad.net"
        for x in all_servers
        if x["type"] == "wireguard" and x["active"]
    ]



def _get(url):
    while True:
        try:
            chosen_proxy = random.choice(get_proxies())
            proxies = {"https": chosen_proxy, "http": chosen_proxy}
            return session.get(url, timeout=5, proxies=proxies)
        except:
            pass


def fetch(url):
    res = _get(url)
    if not res.ok:
        return None
    html_content = res.text
    soup = BeautifulSoup(html_content, "lxml")
    return soup


def fetch_json(url):
    return _get(url).json()
