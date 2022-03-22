import click

from check24scraper.scrape import get_jobs, get_tarifs


@click.command()
@click.option("--jobs", is_flag=True)
@click.option("--tarifs", is_flag=True)
def run(jobs, tarifs):
    if jobs:
        get_jobs()
    elif tarifs:
        get_tarifs()


if __name__ == "__main__":
    run()
