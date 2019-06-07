curl \
  --request POST \
  --header 'Content-Type: application/json' \
  --data-binary @withdraw-data.json \
  --no-buffer \
  --silent \
  'http://localhost:1335/api/account/withdraw'
