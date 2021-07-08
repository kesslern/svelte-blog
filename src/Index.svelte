<script>
  export let html
  export let css
  export let date

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
	<link rel='stylesheet' href='/styles.css'>

  {@html cssStart}
  {@html css.code}
	{@html cssEnd}
</head>

<body>
  {@html html}
  <footer>
    Posted on {date.toLocaleDateString("en-US")}
  </footer>
</body>
</html>
