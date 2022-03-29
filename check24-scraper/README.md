# check24-scraper

## Using Mullvad for scraping

1. Choose a Mullvad server and assign a WireGuard port to the server
2. Find out the public API of the chosen server, e.g., by connecting to your local machine and run curl https://am.i.mullvad.net/connected
3. Install Mullvad linux client and use the CLI to connect to the chosen server
4. Use the assinged port from 1. for SSH
5. After you activate the mullvad vpn on your server, connect to it by SSH using the public IP and the assigned port

## Scripts

```bash
# start.sh
#!/usr/bin/env bash
set -e
set -x

/root/.poetry/bin/poetry run python check24scraper/cli.py --tariffs
```

```bash
# multiple.sh
#!/usr/bin/env bash
set -e
set -x

for i in {1..20}
do
    ( ./start.sh & )
done
```

```bash
# crontab
13 * * * * /root/check24-scraper/start.sh
```

```bash
# deploy.sh
#!/usr/bin/env bash
set -e
set -x

rsync -rvz --exclude notebooks --exclude __pycache__ --exclude http_cache -e 'ssh -p xx' check24-scraper root@xx:~/
```
