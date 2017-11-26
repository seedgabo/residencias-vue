<template lang="jade">
	v-container()
		v-layout(wrap="")
			v-flex(sm-12)
				v-card
					v-toolbar.primary(dark)
						v-icon(dark) fa-ticket
						v-toolbar-title {{ api.trans('literals.tickets') }}
					v-card-text
						v-list(two-line)
							v-list-tile(v-for="ticket in tickets", :key="ticket.id" @click.stop="seeTicket(ticket)")
								v-list-tile-content
									v-list-tile-title {{ticket.subject}}
										small &nbsp; ({{ ticket.comments.length }})
									v-list-tile-sub-title(:class="ticket.status") {{ api.trans('literals.'+ticket.status)}}
									v-list-tile-sub-title() {{ ticket.updated_at | moment("from") }}
								v-list-tile-action
									v-list-tile-action-text 
										v-btn(icon small @click.stop="editTicket(ticket)")
											v-icon edit
		v-btn(fab dark color="pink" fixed bottom right)
			v-icon add
		v-dialog(v-model="editor" fullscreen transition="dialog-bottom-transition", :overlay="false")
			v-card
				v-toolbar(dark color="primary")
					v-spacer
					v-btn(icon @click.native="editor=false")
						v-icon close

</template>

<script lang="coffee">
api = require '../services/api.js'
module.exports =
	name: 'Tickets'
	mounted: ()->
		console.log @api
		@getData()
	data: ->
		api: api
		tickets: []
		ticket:null
		editor:false
		open:false
	methods:
		getData: ()->
			@api.get "tickets?where[user_id]=#{@api.user.id}&with[]=user&with[]=comments&with[]=user.residence&order[updated_at]=desc&take=300"
			.then (resp)=>
				console.log 'data', resp.data
				@tickets = resp.data
			.catch console.error
		seeTicket: (ticket)->
			console.log ticket
			@open = true
		editTicket: (ticket)->
			@ticket = ticket
			@editor = true
			return
		createTicket: (ticket)->
			@ticket = {subject:"",status:"open", user_id:@api.user.id}
			@editor = true
			return
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped>
.open {
	color: #4CAF50 !important;
}

.in.progress {
	color: #FFEB3B !important;
}

.closed {
	color: #2196F3 !important;
}

.rejected {
	color: #F44336 !important;
}
</style>