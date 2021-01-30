ECR_URL=971955089791.dkr.ecr.us-east-1.amazonaws.com

ecr-login:
	aws ecr get-login-password --region us-east-1 --profile cbdevllc | docker login --username AWS --password-stdin $(ECR_URL)

deploy:
	docker build -t zone-builder:latest .
	docker tag zone-builder:latest $(ECR_URL)/zone-builder:latest
	docker push $(ECR_URL)/zone-builder:latest
