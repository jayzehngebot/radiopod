The goal of radiopod is to allow for 1 tap to be listening to a podcast you want to listen to. When you dont have time but you want to have something playing.


it works using some simple logic for how to determine what to play.

also, like radio, it begins a given episode 'In medias res', like you've turned on the radio.

you select podcasts you like. you order them in priority, and theres a little bit of work behind the scenes to determine what is the best guess to play.

right now (10/9/24) the app has Auth. A DB (MongoDB), graphql queries, and a podcast player all running.

TODOS:
    Parsing rss feeds for podcasts
    working search in the podcast selection screen
    ordering selected podcasts to determine priority
    default jump to position work
    interface work

