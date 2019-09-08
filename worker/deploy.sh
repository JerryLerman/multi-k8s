docker build -t jerrylerman/multi-client -f ./client/Dockerfile ./client
docker build -t jerrylerman/multi-server -f ./server/Dockerfile ./server
docker build -t jerrylerman/multi-worker -f ./worker/Dockerfile ./worker
docker push jerrylerman/multi-client
docker push jerrylerman/multi-server
docker push jerrylerman/multi-worker
kubectl apply -f k8s
kubectl set image deployments/server-deployment server=jerrylerman/multi-server
