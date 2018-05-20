![alt text](logo.svg)


Aamks is a linux platform for assesing fire safety of humans in buildings. It
runs hundreds or thousands of fire simulations (CFAST) and evacuation
simulations (a-evac) and then evaluates the results. 

Aamks workflow:

	- read aamks configuration (see examples), e.g.:

		- NUMBER_OF_SIMULATIONS=N
		- BUILDING_CATEGORY="office"
		- ...

	- read geometry from autocad or inkscape
	- create N CFAST input files 
	- create N a-evac input files 
	- dispatch simulations in a network: make workers create fires and evacuate humans.
	- collect workers results in a database
	- compile the N results into distributions

The master branch is by no means guaranteed to work, you better wait for a
release. 
