python -m py_compile $AAMKS_PATH/evac/worker.py && { echo "OK: evac/worker.py"; }
python -m py_compile $AAMKS_PATH/manager/results_collector.py && { echo "OK: manager/results_collector.py"; }

rm $AAMKS_PATH/manager/results_collector.pyc
rm $AAMKS_PATH/evac/worker.pyc
