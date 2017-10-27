<template lang="jade">
	v-container(fluid="")
		v-layout(wrap="")
			v-card
				v-card-text
					v-list
						v-list-tile(v-for="corres in correspondences", :key="corres.id")
							v-list-tile-content
								v-list-tile-title 
									span {{corres.item}}				
</template>

<script lang="coffee">
api = require '../services/api.js'
module.exports =
	name: 'Correspondences'
	mounted: ()->
		@getData()
	data: ->
		api: api
		correspondences: []
		loading:false
	methods:
		getData: ()->
			@loading = true
			@api.get "correspondences?limit=500&where[residence_id]=#{@api.user.residence_id}&order[created_at]=desc&with[]=receptor"
			.then (resp)=>
				console.log 'data', resp.data
				@correspondences=resp.data
				@loading = false
			.catch console.error
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped>
</style>