killall -9 celery
celery -A arun worker --loglevel=info -f celery.log -n worker1@%h -c 1 &
celery -A arun worker --loglevel=info -f celery.log -n worker2@%h -c 1 &
celery -A arun flower &
sleep 2
python3 request.py  &
