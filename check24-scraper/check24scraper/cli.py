import click

from check24scraper.scrape import get_jobs, get_tariffs


@click.command()
@click.option("--jobs", is_flag=True)
@click.option("--tariffs", is_flag=True)
@click.option("--onlyfetch", is_flag=True)
def run(jobs, tariffs, onlyfetch):
    if jobs:
        get_jobs()
    elif tariffs:
        get_tariffs(onlyfetch)


if __name__ == "__main__":
    run()
