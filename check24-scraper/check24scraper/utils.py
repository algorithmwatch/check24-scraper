import gzip
import random
from datetime import datetime, timedelta
from functools import lru_cache
import time

import dataset
from bs4 import BeautifulSoup
from requests import Session
from requests_cache import (
    CachedSession,
    FileCache,
    SerializerPipeline,
    Stage,
    pickle_serializer,
)
from retry_requests import retry

db = dataset.connect("postgresql://postgres:postgres@localhost:5432/postgres")
tab_requests = db["requests"]


def make_session():
    """ """
    # if "CACHE" in os.environ:

    if False:
        compressed_serializer = SerializerPipeline(
            [
                pickle_serializer,
                Stage(dumps=gzip.compress, loads=gzip.decompress),
            ],
            is_binary=True,
        )
        backend = FileCache()
        session = CachedSession(
            backend=backend,
            cache_name="httpcache",
            expire_after=-1,
            cache_control=False,
            allowable_codes=[200, 404],
            serializer=compressed_serializer,
        )
    else:
        session = Session()

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
        chosen_proxy = random.choice(get_proxies())

        prev_res = tab_requests.find(
            proxy=chosen_proxy, order_by="-created_at", _limit=1
        )
        if prev_res is None:
            break

        prev_res = list(prev_res)

        if len(prev_res) == 0:
            break

        print(prev_res)
        prev_res = prev_res[0]
        print(prev_res)

        if (
            prev_res["status"] == 429
            and prev_res["created_at"] + timedelta(hours=1) > datetime.now()
        ):
            print(prev_res)
            # choose new proxy, sleep some time because we scraped too fast
            time.sleep(2)
        else:
            break

    try:
        # print(url)
        proxies = {"https": chosen_proxy, "http": chosen_proxy}
        res = session.get(url, timeout=5, proxies=proxies)
        tab_requests.insert(
            {
                "url": url,
                "time": res.elapsed,
                "status": res.status_code,
                "proxy": chosen_proxy,
                "created_at": datetime.now(),
            }
        )
        print(res.status_code, chosen_proxy)
        if res.status_code == 429:
            time.sleep(2)
            return _get(url)
        else:
            return res
    except Exception as ex:
        print(ex)
        if type(ex) != KeyboardInterrupt:
            return _get(url)


def fetch(url):
    res = _get(url)
    if not res.ok:
        print(res.status_code)
        return None
    html_content = res.text
    soup = BeautifulSoup(html_content, "lxml")
    return soup


def fetch_json(url):
    return _get(url).json()
