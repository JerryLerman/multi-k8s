docker build -t jerrylerman/multi-client:latest -t jerrylerman/multi-client:$SHA -f ./client/Dockerfile ./client
docker build -t jerrylerman/multi-server:latest -t jerrylerman/multi-server:$SHA -f ./server/Dockerfile ./server
docker build -t jerrylerman/multi-worker:latest -t  jerrylerman/multi-worker:$SHA -f ./worker/Dockerfile ./worker

docker push jerrylerman/multi-client:latest
docker push jerrylerman/multi-server:latest
docker push jerrylerman/multi-worker:latest

docker push jerrylerman/multi-client:$SHA
docker push jerrylerman/multi-server:$SHA
docker push jerrylerman/multi-worker:$SHA

kubectl apply -f k8s
kubectl set image deployments/server-deployment server=jerrylerman/multi-server:$SHA
kubectl set image deployments/client-deployment client=jerrylerman/multi-client:$SHA
kubect set  image deployments/worker-deployment worker=jerrylerman/multi-worker:$SHA
