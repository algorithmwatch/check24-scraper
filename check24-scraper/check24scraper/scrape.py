import json
import random
import string
from itertools import product
from pathlib import Path

from datetime import datetime

import dataset
from boltons.iterutils import unique
from tqdm import tqdm

from .utils import fetch, fetch_json

db = dataset.connect("sqlite:///data.sqlite")
tab_res = db["results"]


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


def parse_html(html):
    results = []

    for row in html.select(".c24-result-row"):
        if not "data-tariff-id" in row.attrs:
            continue

        result = {}
        result["tariff_id"] = row.attrs["data-tariff-id"]
        result["tariff_name"] = row.attrs["data-tariff-name"]
        result["tariff_variation"] = row.attrs["data-tariff-variation-key"]
        result["tariff_grade"] = row.attrs["data-tariff-grade"]
        result["promotion_position"] = row.attrs["data-promotion-position"]
        result["provider"] = row.attrs["data-tariff-provider"]
        result["price"] = row.select_one(".rlv-price__amount").attrs[
            "data-price-primary"
        ]
        results.append(result)

    return results


def _get_tariff(oc, dob, smoker):
    lookup = {"oc_id": oc[0], "oc_name": oc[1], "dob": dob, "smoker": smoker}

    exists = tab_res.find_one(**lookup)
    if exists:
        return

    # special for 'never smoked'
    nonsmokeryears = 255

    url = f"https://vorsorge.check24.de/risikoleben/vergleichsergebnis/?c24api_rs_lang=&c24api_rs_session=&c24login_type=none&c24api_realestateproprietor=no&c24api_insurepersondiffers=no&c24api_children_discount=no&c24api_loannotolderthansixmonths=no&c24_controller=result&c24_calculate=x&c24api_currentinsurancetype=&c24api_smoker={smoker}&c24api_nonsmokeryears={nonsmokeryears}&c24api_birthdate={dob}&c24api_protectiontype=constant&c24api_protectiontarget=family&c24api_occupation_id={oc[0]}&c24api_sum_course=decreasing_linearly&c24api_sortfield=price&c24api_sortorder=asc&has_filter_active=false&c24api_insure_sum=200.000&c24api_insure_period=20&c24api_paymentperiod=month&c24api_occupation_name={oc[1]}&c24api_insure_date=2022-04-01"
    html = fetch(url)

    if html is None:
        raise Exception("fuck")

    results = parse_html(html)
    lookup["created_at"] = datetime.utcnow()
    results = [r | lookup | {"rank": i} for i, r in enumerate(results)]

    print(results)

    tab_res.insert_many(results)

    tab_res.create_index(["oc_id", "oc_name", "dob", "smoker"])


def get_tariffs():
    option_jobs = json.loads(Path("jobs.json").read_text())
    option_dob = [f"{y}-12-13" for y in range(1945, 2000)]
    option_smoker = ["yes", "no"]
    prods = list(product(option_jobs, option_dob, option_smoker))

    random.shuffle(prods)

    for x in tqdm(prods):
        _get_tariff(*x)
