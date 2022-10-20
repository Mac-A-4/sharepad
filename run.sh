docker build -t sharepad .
docker run -d -p 8080:8080 sharepad --restart unless-stopped