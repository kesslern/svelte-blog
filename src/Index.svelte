<script>
  export let posts
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
  <ul>
    {#each posts as post}
      <li><a href={post.url}>{@html post.title}</a></li>
    {/each}
  </ul>
</body>
</html>
