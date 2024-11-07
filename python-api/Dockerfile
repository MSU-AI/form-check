
FROM python:3.10


WORKDIR /code


COPY ./requirements.txt /code/requirements.txt


RUN apt-get update && apt-get install -y libgl1


RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt


COPY ./app /code/app


CMD ["fastapi", "run", "app/main.py", "--proxy-headers", "--port", "80"]
