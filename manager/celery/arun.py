from celery import Celery
import time

app = Celery('aamks', broker='pyamqp://')

@app.task
def aamks_run(x):
    time.sleep(5)
    with open("/tmp/hello.txt", "a") as f: 
        f.write(str(x**2)+"\n")
    return x**2
