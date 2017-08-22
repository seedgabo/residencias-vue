<template lang="jade">
	v-container(fluid="")
		v-layout(wrap="")
				
</template>

<script lang="coffee">
api = require '../services/api.js'
module.exports =
	name: 'Example'
	mounted: ()->
		console.log @api
		@getData()
	data: ->
		api: api
		data: []
	methods:
		getData: ()->
			@api.get 'data'
			.then (resp)=>
				console.log 'data', resp.data
				@data=resp.data
			.catch console.error
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped>
	
</style>