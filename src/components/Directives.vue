<template lang="jade">
	v-container()
		v-layout(wrap="")
			v-flex(sm-12)
				v-card
					v-toolbar.primary(dark)
						v-toolbar-title {{api.trans('literals.directives')}}
					v-card-text
						v-list(two-line)
							v-list-tile(v-for="dir in directives", :key="dir.id")
								v-list-tile-content
									v-list-tile-title {{dir.name}}
									v-list-tile-sub-title {{ dir.phone_number }}
									v-list-tile-sub-title {{ dir.email }}
								v-list-tile-action
										span ({{dir.charge}})
				
</template>

<script lang="coffee">
api = require '../services/api.js'
module.exports =
	name: 'Directives'
	mounted: ()->
		console.log @api
		@getData()
	data: ->
		api: api
		directives: []
	methods:
		getData: ()->
			@api.get 'directives'
			.then (resp)=>
				console.log 'data', resp.data
				@directives=resp.data
			.catch console.error
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped>
</style>