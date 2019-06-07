data="{\"atmId\":\"$(echo $1)\",\"accountHash\":\"$(echo $2)\",\"amount\": $(echo $3)}";

curl \
  --request POST \
  --header 'Content-Type: application/json' \
  --data "$data" \
  --no-buffer \
  --silent \
  'http://localhost:1335/api/account/withdraw'
