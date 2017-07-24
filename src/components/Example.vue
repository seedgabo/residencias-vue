<template lang="jade">
	v-container(fluid="")
		v-layout(wrap="")
				
</template>

<script lang="coffee">
module.exports =
	name: 'Example'
	mounted: ()->
		console.log @api
		@getSurveys()
	data: ->
		api: require '../services/api.js'
		surveys: []
	methods:
		getData: ()->
			@api.get 'data'
			.then (resp)=>
				console.log 'data', resp.data
				@surveys=resp.data
			.catch console.error
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped>
	
</style>