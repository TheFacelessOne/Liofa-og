![Liofa-og](https://socialify.git.ci/TheFacelessOne/Liofa-og/image?font=KoHo&logo=https%3A%2F%2Fsvgshare.com%2Fi%2F19F4.svg&name=1&pattern=Diagonal%20Stripes&theme=Light)

### Liofa is a Discord moderation bot. 
##### Liofa's intended use is for servers that only allow certain languages to be spoken. Liofa communicates what languages may be spoken on the server in a way users can easily understand.
### [Click Here](https://discord.com/oauth2/authorize?client_id=866186816645890078&permissions=274877982720&scope=applications.commands%20bot) to get Liofa
### [Click Here](https://discord.gg/ay7uzuHctN) to join liofa's discord server. Get help and news from here.

| :exclamation: | This bot is an ongoing project. This is a rewrite of another project and will not be released until it has more of the features that the old project has. When released, this project will not be a seperate bot, it will replace the old bot. |
|------------|:-----------------------------------------|
  
# Getting started
Once you've added liofa to your server, run the ```/setup``` command to tailor liofa to your needs

I advise selecting the "Setup Wizard" from the select menu.

To test if Liofa is working, send a message in a language that is not whitelisted. I typically use the phrase ```Bonjour, Ca Va?```. Liofa has filters to stop it from checking every message. Please make sure the messages you are using for testing are long enough.



## What Liofa does

- Language Detection
	- Uses [lingua-py](https://github.com/pemistahl/lingua-py) to detect languages
	- Liofa responds to users with a message translated into their language
	- The message optionally contains
		- a link to google translate
		- the user's avatar
		- The list of accepted langauges in their native language or in English

<img src="https://i.imgur.com/YzXrXUc.png" alt="imgur" width="300rem"/>
<img src="https://i.imgur.com/dbuBv1S.png" alt="imgur" width="315 rem">
<img src="https://i.imgur.com/u6EcnLr.png" alt="imgur" width="280rem">

- Settings
	- The ```/setup```command opens a menu where you can control how Liofa functions
	- The options include a setup wizard that will walk you through the basics of setting up Liofa

<img src="https://i.imgur.com/vLoRGdt.png" alt="imgur" width="280rem">
<img src="https://i.imgur.com/veM3pQq.png" alt="imgur" width="180rem">

## FAQ
- Liofa isn't working?
	- Try testing with a longer message. Liofa uses a filtering system which means that very short messages are excluded altogether. Longer messages will give Liofa more accurate results and Liofa will only trigger if it is confident about its results. We may allow editing the confidence level required in the future.
	- If Liofa is still not working, come visit us on [Liofa's discord server](https://discord.gg/ay7uzuHctN) and ask for help or [submit an issue](https://github.com/TheFacelessOne/Liofa-og/issues/new) on github.

- Liofa is triggering too often
	-	Check your whitelisted languages, you may need to allow languages that are similar or have similar origins to your currently approved languages. Some words are shared between languages and some words have different meanings in other languages. This can cause Liofa to misinterpret languages.

- Why are English and Irish enabled by default?
	- English is enabled because it is [TheFacelessOne](https://github.com/TheFacelessOne)'s spoken language.
	- Irish is enabled because [TheFacelessOne](https://github.com/TheFacelessOne) is Irish. Irish (or Gaeilge) is not widely spoken even within Ireland due to historical events. [TheFacelessOne](https://github.com/TheFacelessOne) does not speak Irish fluently but does not wish to discourage speaking Irish in any way so this is his small attempt at helping the language. __You can easily remove Irish from the list of approved languages in your server if you wish.__ 
		###### [Click Here](https://www.youtube.com/watch?v=JqYtG9BNhfM) to watch a short comedy about a man learning Irish and moving to Ireland
  

## About Liofa

Liofa (or Líofa) is Irish for "fluent".

Liofa is a bot that like many inventions, came out of necessity. Liofa began as a way to teach myself to code while solving a problem. Liofa has since expanded beyond my expectations. Due to my inexperience at the time, I feel that I did not lay a good foundation within my initial [Liofa-Bot](https://github.com/TheFacelessOne/Liofa-Bot) project to allow for further expansion. To remedy this, I have rewritten Liofa from scratch in Typescript and using [lingua-py](https://github.com/pemistahl/lingua-py) instead of cld3. Líofa-Óg is a new version with an emphasis on being more user friendly and customizable.

I hope you all enjoy my little bot. If you have any questions or suggestions, please do let me know. I started this project when I was still relatively new to coding and with the help of some fantastic people, I can say I'm proud of what it has become.