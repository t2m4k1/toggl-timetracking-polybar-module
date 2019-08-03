<img src="https://cloud.tmk241.tk/s/Xx2gKMTqLncNX6A/preview" alt="https://cloud.tmk241.tk/s/Xx2gKMTqLncNX6A/preview" class="overflowingHorizontalOnly">

# Description
* Shows all unique time-entry names of the last seven days in your polybar.
* Clicking on them will start a new time entry with the given description name.
* A running time entry is indicated by text highlighted in green (see screenshot).
* It can be stopped by another click on it.
Since this plugin is querying the toggl-API, keep in mind that the plugin takes 2-3 seconds to react.

# Installation
* Install npm and nodejs
* Switch to cloned folder and run "npm install"
* Use toggl-website to start a new time-entry, if you currently have none. Remember to give it a name (e.g. "Masterarbeit" in Screenshot)
* Copy token.json.example to token.json
* Edit the new token.json file according to the instructions in it
* Find your API-Key at the bottom of your toggl profile page https://toggl.com/app/profile

# Disclaimer
Since I've created this plugin mostly for myself, its code might be a little clunky :)

# Adding module to polybar config

    [module/toggl]
    type = custom/script
    interval = 3
    exec = node ######FILL IN FILE DIRECTORY######/queryToggl.js

