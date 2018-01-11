var keys = require('./keys.js')
let command = process.argv[2]
var extraArgs = ''

for (var i = 3; i < process.argv.length; i++) {
  extraArgs += process.argv[i] + ' '
}

processCommand(command)

function processCommand(command) {
  console.log(`Command:${command}`)
  if (command === 'my-tweets') {
    tweets()
  } else if (command === 'spotify-this-song') {
    spotify(extraArgs)
  } else if (command === 'movie-this') {
    movie(extraArgs)
  } else if (command === 'do-what-it-says') {
    doit(extraArgs)
  } else {
    console.log('Invalid command')
    return
  }
}

function tweets() {
  var Twitter = require('twitter')

  var client = new Twitter({
    consumer_key: keys.twitterKeys.consumer_key,
    consumer_secret: keys.twitterKeys.consumer_secret,
    access_token_key: keys.twitterKeys.access_token_key,
    access_token_secret: keys.twitterKeys.access_token_secret
  })
  var params = {
    screen_name: 'NastySmash',
    count: 20
  }
  client.get('statuses/user_timeline', params ,function(error, tweets, response) {
    if (error) {
      console.log(error)
    } else {
      for (var i = 0; i < tweets.length; i++) {
        console.log(`${tweets[i].text}\n${tweets[i].created_at}\n`)
      }
    }
  })
}

function spotify(name) {
  var Spotify = require('node-spotify-api')

  var spotify = new Spotify({
    id: keys.spotifyKeys.id,
    secret: keys.spotifyKeys.secret
  })
  // if name is blank, show default song
  if (name === '') {
    spotify.request('https://api.spotify.com/v1/tracks/3DYVWvPh3kGwPasp7yjahc')
      .then(function(response) {
        console.log(`
          Artists: ${response.artists[0].name}
          Song Name: ${response.name}
          Preview Link: ${response.preview_url}
          Album: ${response.album.name}
        `)
      })
      .catch(function(error) {
        console.error('Error occurred: ' + error)
      })
    return
  }
  var params = {
    type: 'track',
    query: name
  }
  spotify.search(params, function(error, response) {
    if (error) {
      console.log(error)
    } else {
      process.stdout.write('Artists: ')
      for (var i = 0; i < response.tracks.items[0].artists.length; i++) {
        process.stdout.write(response.tracks.items[0].artists[i].name);
        if (i < response.tracks.items[0].artists.length-1) {
          process.stdout.write(', ');
        }
      }
      console.log(`\nSong name: ${response.tracks.items[0].name}`)
      process.stdout.write('Preview Link: ')
      if (response.tracks.items[0].preview_url !== null) {
        process.stdout.write(response.tracks.items[0].preview_url)
      } else {
        process.stdout.write(' No preview available')
      }
      console.log(`\nAlbum: ${response.tracks.items[0].album.name}`)
    }
  })
}

function movie(name) {
  var request = require('request')
  if (name === '') {
    name = 'Mr. Nobody'
  }
  var result = name.replace(' ', '+')
  var queryUrl = `http://www.omdbapi.com/?t=${result}&y=&plot=short&apikey=${keys.omdbKeys.key}`

  request(queryUrl, function(error, response) {
    if (error) {
      console.error(error)
    } else {
      var responseBody = JSON.parse(response.body)
      console.log(`
        ${responseBody.Title}
        Release Year: ${responseBody.Year}
        IMDB Rating: ${responseBody.imdbRating}
        Rotten Tomatoes Rating: ${responseBody.Ratings[1].Value}
        Made in ${responseBody.Country}
        Language: ${responseBody.Language}
        Plot: ${responseBody.Plot}
        Actors: ${responseBody.Actors}
      `)//this assumes Ratings[1] will always choose Rotten Tomatoes
    }
  })
}

function doit(filename) {
  var fs = require('fs')
  fs.readFile(`./${filename.trim()}`, 'utf8', function(error, data) {
    if (error) {
      console.error(error)
    } else {
      processCommand(data.replace(',', ' '))
    }
  })
}
