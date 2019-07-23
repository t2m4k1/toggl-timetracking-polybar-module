<img src="https://cloud.tmk241.tk/s/Xx2gKMTqLncNX6A/preview" alt="https://cloud.tmk241.tk/s/Xx2gKMTqLncNX6A/preview" class="overflowingHorizontalOnly">

Installation:
Install npm and nodejs
Switch to cloned folder and run "npm install"

Adding module to polybar config:

    [module/toggl]
    type = custom/script
    interval = 3
    exec = node ######FILL IN FILE DIRECTORY######/queryToggl.js

