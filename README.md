![alt text](http://www.inf.sgsp.edu.pl/pub/MALUNKI/NOWE/aamks.svg)


Aamks is a linux platform for assesing fire safety of humans in buildings. It
runs hundreds or thousands of fire simulations (CFAST) and evacuation
simulations (a-evac) and then evaluates the results. 

Aamks workflow:
* read aamks configuration (see examples), e.g.:

	NUMBER_OF_SIMULATIONS=999
	BUILDING_CATEGORY="office"
	...

* read geometry from autocad or inkscape
* create 999 CFAST input files 
* create 999 a-evac input files 
* dispatch simulations in a network: make workers create fires and evacuate humans.
* collect workers results in a database
* compile the 1300 results into distributions

The master branch is by no means guaranteed to work - you better wait for a
release. 
