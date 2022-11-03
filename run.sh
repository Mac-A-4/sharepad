docker kill $(docker ps -q)
docker build -t sharepad .
docker run -d --restart unless-stopped -p 8080:8080 sharepad