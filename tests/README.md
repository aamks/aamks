# Info
Tests using pytest library 

# Installation library 
```
pip3 install pytest
​pip3​​ ​​install​​ ​​pytest-cov​
```

# Running tests
If your IDE do not provide running tests, you can run tests on command line\
On project root folder run 
* Runs all unit tests:
```
pytest -v tests/unit/
```
* Run all unit tests and generate xml report
```
pytest -v tests/unit/ --junit-xml=results.xml
```

* Run all tests, calculate coverage and generate html report
```
pytest tests/unit/ --cov-report=html --cov=evac
```

### Library requirements on project
```
pip3 install scipy
```
