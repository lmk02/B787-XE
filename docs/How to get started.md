## How to mod a standard plane in Microsoft Flightsimulator 2020

I would like to focus on the cockpit displays in this small guide because we are only able to edit those without releasing the decrypted and probably illegal to distribute files.

It would be good to already have some knowledge about JavaScript, HTML and CSS.

### 1. Unterstand the folder structure
You probably already had a look at your 'Community' folder. We want to only work in this folder. Do not modify the files in the 'Official' folder that's right next to the 'Community' folder. Let's head over to '\Official\OneStore'. You'll see every standard plane. For this mod the most important folders are 'asobo-aircraft-b787-10' and 'asobo-vcockpits-instruments-b787-10'. You are able to edit switches etc. in 'asobo-aircraft-b787-10' (once we are allowed to use the decrypted files). To edit the cockpit displays we need to look into 'asobo-vcockpits-instruments-b787-10' and modify the files located in this folder. 

### 2. Add new files
We want to modify the files in 'asobo-vcockpits-instruments-b787-10' without doing it in the 'Official' folder. So just copy over the files to your workspace. But you still want to keep the folder structure like it is in the 'asobo-vcockpits-instruments-b787-10' folder.

If you already cloned this GitHub repo, just check if the file (you want to edit) already exists in this repo. If that's not the case, you'll have to copy over the file and add the path to the layout.json file.

### 3. Edit cockpit displays
#### 3.1 Add an Inop. Page
If you want to add a new page to, for example, the MFD, you'll have to design that page as a SVG to be able to use it and animate it and change values via JavaScript. Have a look at the official or our files to get an better understanding.

### 4. Use the WebUI dev kit
This allows you to see JavaSript console logs and reload js, html and css files while MSFS is running. https://github.com/dga711/msfs-webui-devkit

### 5. Check the official documentation
The most important part of the documentation is the variable list. Most of the simulator vars are listed. You most probably have to use them.

----

_incomplete, will be finished in the next days_