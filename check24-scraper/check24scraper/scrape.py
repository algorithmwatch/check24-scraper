import json
import string
from pathlib import Path

from itertools import product
from boltons.iterutils import unique
from tqdm import tqdm

from .utils import fetch, fetch_json


def get_jobs():
    all_data = []
    for letter in tqdm(string.ascii_lowercase):
        resp = fetch_json(
            f"https://vorsorge.check24.de/ajax/json/occupation?snippet={letter}&limit=10000"
        )
        data = json.loads(resp["content"]["data"])
        all_data += data

    all_data = unique(all_data, key=lambda x: x[0])

    print(len(all_data))

    Path("jobs.json").write_text(json.dumps(all_data))


def _get_tarif(oc, dob, smoker):
    url = f"https://vorsorge.check24.de/risikoleben/vergleichsergebnis/?c24api_rs_lang=&c24api_rs_session=&c24login_type=none&c24api_realestateproprietor=no&c24api_insurepersondiffers=no&c24api_children_discount=no&c24api_loannotolderthansixmonths=no&c24_controller=result&c24_calculate=x&c24api_currentinsurancetype=&c24api_smoker={smoker}&c24api_nonsmokeryears=1&c24api_birthdate={dob}&c24api_protectiontype=constant&c24api_protectiontarget=family&c24api_occupation_id={oc[0]}&c24api_sum_course=decreasing_linearly&c24api_sortfield=price&c24api_sortorder=asc&has_filter_active=false&c24api_insure_sum=150.000&c24api_insure_period=15&c24api_paymentperiod=month&c24api_occupation_name={oc[1]}&c24api_insure_date=2022-04-01"
    res = fetch(url)
    if res is None:
        raise Exception("fuck")


def get_tarifs():
    option_jobs = json.loads(Path("jobs.json").read_text())
    option_dob = [f"{y}-12-13" for y in range(1945, 2000)]
    option_smoker = ["yes", "no"]
    prods = list(product(option_jobs, option_dob, option_smoker))
    for x in tqdm(prods):
        _get_tarif(*x)
