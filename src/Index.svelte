<script>
  export let html
  export let css

  const cssStart = "<style>"
  const cssEnd = "</style>"
</script>

<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset='utf-8'>
	<meta name='viewport' content='width=device-width,initial-scale=1'>

	<title>A Wandering Observer</title>

	<link rel='icon' type='image/png' href='/favicon.png'>
  <style>
    body{
      margin:1em auto;
      max-width:40em;
      padding:0 .62em;
      font:1.2em/1.62 sans-serif;
    }
    h1,h2,h3 {
      line-height:1.2;
    }
    @media print{
      body{
        max-width:none
      }
    }
    body {
      font-family: Open Sans, Arial;
      color: #454545;
      font-size: 16px;
      margin: 2em auto;
      max-width: 800px;
      padding: 1em;
      line-height: 1.4;
      text-align: justify
    }
  	html.inverted {
		background-color: #000
	}
	html.inverted body {
		color: #d9d9d9
	}
	html.inverted #contrast,
	html.inverted #invmode {
		color: #fff;
		background-color: #000
	}
	html.inverted blockquote {
		color: #d3c9be
	}
	html.inverted blockquote:before {
		color: #b8b8b8
	}
	html.inverted a {
		color: #00a2e7
	}
	html.inverted a:visited {
		color: #ca1a70
	}
	html.inverted span.wr {
		color: #d24637
	}
	html.inverted span.mfw {
		color: #b00000
	}
	html.inverted.contrast {
		background-color: #000
	}
	html.inverted.contrast body {
		color: #fff
	}
	html.inverted.contrast #contrast,
	html.inverted.contrast #invmode {
		color: #fff;
		background-color: #000
	}
	html.inverted.contrast blockquote {
		color: #f8f6f5
	}
	html.inverted.contrast blockquote:before {
		color: #e5e5e5
	}
	html.inverted.contrast a {contrast
		color: #44c7ff
	}
	html.inverted.contrast a:visited {
		color: #e9579e
	}
	html.inverted.contrast span.wr {
		color: #db695d
	}
	html.inverted.contrast span.mfw {
		color: #ff0d0d
	}
}

@media (prefers-color-scheme:dark) {
	html:not(.inverted) {
		background-color: #000
	}
	html:not(.inverted) body {
		color: #d9d9d9
	}
	html:not(.inverted) #contrast,
	html:not(.inverted) #invmode {
		color: #fff;
		background-color: #000
	}
	html:not(.inverted) blockquote {
		color: #d3c9be
	}
	html:not(.inverted) blockquote:before {
		color: #b8b8b8
	}
	html:not(.inverted) a {
		color: #00a2e7
	}
	html:not(.inverted) a:visited {
		color: #ca1a70
	}
	html:not(.inverted) span.wr {
		color: #d24637
	}
	html:not(.inverted) span.mfw {
		color: #b00000
	}
	html:not(.inverted).contrast {
		background-color: #000
	}
	html:not(.inverted).contrast body {
		color: #fff
	}
	html:not(.inverted).contrast #contrast,
	html:not(.inverted).contrast #invmode {
		color: #fff;
		background-color: #000
	}
	html:not(.inverted).contrast blockquote {
		color: #f8f6f5
	}
	html:not(.inverted).contrast blockquote:before {
		color: #e5e5e5
	}
	html:not(.inverted).contrast a {
		color: #44c7ff
	}
	html:not(.inverted).contrast a:visited {
		color: #e9579e
	}
	html:not(.inverted).contrast span.wr {
		color: #db695d
	}
	html:not(.inverted).contrast span.mfw {
		color: #ff0d0d
	}
	html.inverted html {
		background-color: #fefefe
	}
}

a {
	color: #07a
}

a:visited {
	color: #941352
}

.noselect {
	-webkit-touch-callout: none;
	-webkit-user-select: none;
	-khtml-user-select: none;
	-moz-user-select: none;
	-ms-user-select: none;
	user-select: none
}

span.citneed {
	vertical-align: top;
	font-size: .7em;
	padding-left: .3em
}

small {
	font-size: .4em
}

p.st {
	margin-top: -1em
}

div.fancyPositioning div.picture-left {
	float: left;
	width: 40%;
	overflow: hidden;
	margin-right: 1em
}

div.fancyPositioning div.picture-left img {
	width: 100%
}

div.fancyPositioning div.picture-left figure {
	margin: 10px
}

div.fancyPositioning div.picture-left figure figcaption {
	font-size: .7em
}

div.fancyPositioning div.tleft {
	float: left;
	width: 55%
}

div.fancyPositioning div.tleft p:first-child {
	margin-top: 0
}

div.fancyPositioning:after {
	display: block;
	content: "";
	clear: both
}

ul li img {
	height: 1em
}

blockquote {
	color: #456;
	margin-left: 0;
	margin-top: 2em;
	margin-bottom: 2em
}

blockquote span {
	float: left;
	margin-left: 1rem;
	padding-top: 1rem
}

blockquote author {
	display: block;
	clear: both;
	font-size: .6em;
	margin-left: 2.4rem;
	font-style: oblique
}

blockquote author:before {
	content: "- ";
	margin-right: 1em
}

blockquote:before {
	font-family: Times New Roman, Times, Arial;
	color: #666;
	content: open-quote;
	font-size: 2.2em;
	font-weight: 600;
	float: left;
	margin-top: 0;
	margin-right: .2rem;
	width: 1.2rem
}

blockquote:after {
	content: "";
	display: block;
	clear: both
}

@media screen and (max-width:500px) {
	body {
		text-align: left
	}
	div.fancyPositioning div.picture-left,
	div.fancyPositioning div.tleft {
		float: none;
		width: inherit
	}
	blockquote span {
		width: 80%
	}
	blockquote author {
		padding-top: 1em;
		width: 80%;
		margin-left: 15%
	}
	blockquote author:before {
		content: "";
		margin-right: inherit
	}
}

span.visited {
	color: #941352
}
  </style>

  {@html cssStart}
  {@html css.code}
	{@html cssEnd}
</head>

<body>{@html html}</body>
</html>
