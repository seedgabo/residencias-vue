<template lang="jade">
	v-layout(wrap)
		v-flex(xs12)
			v-card(dense)
				v-card-title.primary
					v-icon(dark) people
					span.white--text &nbsp; {{api.trans('literals.visitors')}}
					v-spacer
					v-btn.cyan(dark fab small absolute right ,@click.stop="creator=true")
						v-icon add
				v-card-text
					v-list
						v-list-tile(v-for="visitor in api.residence.visitors", :key="visitor.id", avatar="")
							v-list-tile-avatar
								img(:src="visitor.img.url")
							v-list-tile-title {{visitor.name}}
		v-dialog(v-model="creator")
			v-card
				v-card-title 
					span.title {{api.trans('crud.add')}} {{api.trans('literals.visitor')}}
					v-spacer
					v-btn(small icon @click="creator=false")
						v-icon close
				v-card-text
					v-text-field(:label="api.trans('literals.name')" prepend-icon="person")
					v-text-field(:label="api.trans('literals.document')" prepend-icon="card_membership")
					v-text-field(:label="api.trans('literals.phone_number')" prepend-icon="phone")
				v-divider
				v-card-actions
					v-btn(flat primary) {{api.trans('crud.save')}}
					v-btn(@click="creator=false" flat primary) {{api.trans('crud.cancel')}}
</template>

<script lang="coffee">
api=require '../services/api.js'
module.exports =
	name: 'Visitors'
	mounted: ()->
		@getVisitors()
	data: ->
		api: api
		creator: false
		visitor:{}
	methods:
		getVisitors: ()->
			@api.get """visitors?where[residence_id]=#{api.user.residence_id}"""
			.then (resp)=>
				console.log 'visitors', resp.data
				@api.residence.visitors=resp.data
			.catch console.error
		createVisitor: ()->
			@api.post """visitors""",visitor
			.then (resp)=>
				console.log resp.data
		updateVisitor: (visitor)->
			@api.put """visitors/#{visitor.id}""",visitor
			.then (resp)=>
				console.log resp.data
		deleteVisitor: (visitor)->
			@api.put """visitors/#{visitor.id}"""
			.then (resp)=>
				console.log resp.data
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped>
	
</style>