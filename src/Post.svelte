<script>
  export let html
  export let date
</script>

<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset='utf-8'>
	<meta name='viewport' content='width=device-width,initial-scale=1'>

	<title>A Wandering Observer</title>

	<link rel='icon' type='image/png' href='/favicon.png'>
	<link rel='stylesheet' href='/styles.css'>
</head>

<body>
  {@html html}
  {#if date}
  <footer>
    Posted on {date.toLocaleDateString("en-US")}
  </footer>
  {/if}
</body>
</html>
