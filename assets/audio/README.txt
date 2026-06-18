Login background music.

CURRENT SETUP: the login page (portal/login.html) plays a self-hosted file:

    Hans_Zimmer_-_Aurora_(SkySound.cc).mp3

Behaviour:
- Starts on the visitor's first click/keypress (browsers block audio autoplay),
  or via the floating green music button (bottom-right).
- Begins at 0:15, fades in, loops back to 0:15, volume ~0.14 (14%).
- The music button mutes/unmutes; the choice is remembered (localStorage).

To change the track: drop a new MP3 here and update the <source src="..."> in
portal/login.html (or just tell me the new filename and I'll update it).
To change start time / volume: ask me, or edit START and VOL in that script.
