---
title: "Salt on the Road - Tracking Gritters by webscraping"
description: "The Dutch road authority put live gritter-truck positions behind an unadvertised API, so I logged it over time to map where they actually drive."
pubDate: 2016-01-16
category: "Projects"
tags: ["Pet Project", "JavaScript", "Web Scraping", "Maps"]
heroImage: "/images/gritter-map-day.png"
---

![The Rijkswaterstaat website](/images/gritter-rws-site.png)

Last year, the Dutch Rijkswaterstaat (a part of the Dutch Ministry of Infrastructure and the Environment) released a website where you could track where salt scattering trucks - also known as gritters - moved in real-time. This is particularly useful as Dutch infrastructure always seems to shut down completely during the first days of mild snow and you need to know if there's a chance you might make it to work today.

The Rijkswaterstaat website features a Google Maps widget that shows which trucks are active and moving and which are not.

![The Rijkswaterstaat website](/images/gritter-rws-site.png)

# Getting the data

The website features an API, which while not publicly advertised can be found by opening dev tools in any modern browser and looking at the requests made by the page. This url can then be approached via the URL.

Snooping around I found a nice stream of JSON data:

```javascript
{"id":"108191021","workcode_id":"34","latitude":"52.053938","longitude":"5.115533"}
```

The response includes:

- coordinate pairs in latitude and longitude (in WGS84!)
- a truck identifier (id)
- a code whether the truck is active or not. (workcode_id)

# Visualizing the data

I quickly wrote a small script to download this JSON from their site - every sixty seconds or so - and started to build my own real-time overview of the gritter truck by converting the data to GeoJSON and plotting it in [TNO's Common Sense](https://github.com/TNOCS/csWeb). This yielded the following image.

![A map of the Netherlands. Each point represents a truck. White circles indicate the truck is currently operating, while orange stands for being on standby.](/images/gritter-map-points.png)

At this point I could only see where they were located. If I wanted to get new data I would have to refresh my map, and I'd still be working with point data. I had to find a way to collect historical data of the trucks.

A second version of the script used an array of past values to collect historical data. Every time the script requested the JSON file, I would add the new values to an array I'd connect to each truck, and save it on my local file system. With a little bit of extra code I converted these to GeoJSON [LineStrings](http://geojson.org/geojson-spec.html#linestring), which are essentially lines between each coordinate pair I received. Now I had a way to show where trucks had been moving. The following image is aggregated from a day worth of data:

![An overview of a day's worth of movements](/images/gritter-map-day.png)

Not surprisingly, it only showed which roads were part of the Rijkswaterstaat's responsibility: main high ways et cetera. What was kind of cool though was that you could see exactly where they were, including ramps.

![Highway crossing](/images/gritter-highway.png)

# Wrapping up

That's about it. I found the data, transformed it, and made a pretty image of it. Very little code had to be written thanks to the tools available.  

The code can be found on [Github](https://github.com/jeffluppes/strooiwagens) for anyone who wants to mess with it.

*Update: The Rijkswaterstaat website has been updated and the API path has been changed. You can find the new JSON file [here](http://rijkswaterstaatstrooit.nl/wagensvol.json) They also added a nice historical viewing option, which shows you where trucks have been in the past six hours. *
