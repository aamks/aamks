![alt text](logo.svg)


Aamks is an open source, web-based platform for assessing the fire safety of humans in buildings.
Basic concept relies on combined Mont-Carlo simulations of fire and evacuation.
Aamks runs multiple fire simulations (CFAST) and evacuation simulations
(Aamks.Evac) and then evaluates the results. In each simulation humans
are moving across the building and are affected by fire and smoke.

Aamks workflow:

	- user defines the project variables

		- NUMBER_OF_SIMULATIONS=N
		- BUILDING_CATEGORY="office"
		- ...

	- user creates the geometry with Aamks.Apainter in Google Chrome
	- Aamks creates N of CFAST and Aamks.Evac input files 
	- Aamks dispatches and manages the simulations in a network
	- Aamks collects the simulations results in a Postgres database
	- Aamks compiles the N results into distributions for the report
	- Aamks.Animator displays the animations based on the simulations

For the user Aamks is web-based so doesn't need to be installed. On the backend
Aamks requires Linux, Postgres, Apache and Python. Aamks uses such technologies as Navmesh and RVO2.

More information can be found on [wiki](https://github.com/aamks/aamks/wiki).

**You can test Aamks on [Fire Univerity's server](https://aamks.apoz.edu.pl).
No computational resources are available there, so you can go through the 
preprocess only and get familiar with the tool.**

Feel free to [contact](aamks@apoz.edu.pl) us.
