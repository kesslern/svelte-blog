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
  {@html cssStart}
  {@html css.code}
	{@html cssEnd}
</head>

<body>{@html html}</body>
</html>
