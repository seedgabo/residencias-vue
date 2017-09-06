<template lang="jade">
	div(fluid="")
		v-layout(wrap="")
			v-flex(xs3)
				v-list.pt-0(dark style="height:85vh")
					v-list-tile
						span {{api.trans('literals.chats')}}
						v-spacer
						v-btn.pink(fab small)
							v-icon(dark) add
					v-list-tile(@click="selectChat(thread)" v-for="thread in chats", :key="thread.id")
						v-list-tile-content
							v-list-tile-title {{ thread.subject }}
						v-list-tile-action
							v-icon(primary) question_answer
			v-flex(xs9)
				v-card.mx-2.pa-2(v-if="chat")
					v-subheader.grey.lighten-2
						v-avatar.blue
							v-icon(dark) home 
						span {{ chat.subject }}
					v-card-text(ref="chatBody" style="max-height:400px;overflow:scroll;")
						v-layout.chat-message.pa-1(v-for="msg in messages")
							v-flex(xs1)
								v-avatar.mt-2(size="38px")
									img(:src="api.user.image_url")
							v-flex(xs9)
								p: b {{api.user.name}}
								span.caption.text-xs-justify {{msg.body}}
							v-flex.text-xs-right(xs2)
								small {{ msg.created_at | moment('from') }}
					v-card-actions
						v-text-field(placeholder="Type your message" v-model="text" v-on:keyup.enter="send()")
						v-btn(@click="send()" primary icon dark large, :disabled="text.length===0", :loading="sending")
							v-icon send
						
				
</template>

<script lang="coffee">
api = require '../services/api.js'
module.exports =
	name: 'Chat'
	mounted: ()->
		@getData()
	data: ->
		api: api
		chats: []
		chat: null
		messages:[]
		text:""
		sending: false
	methods:
		getData: ()->
			@api.get "messages"
			.then (resp)=>
				console.log 'data', resp.data
				@chats=resp.data
			.catch console.error
		getMessages: (threadId)->
			@api.get "messages/#{threadId}"
			.then (resp)=>
				console.log 'data', resp.data
				@messages = resp.data.messages.reverse()
				@scrolltoBottom()
			.catch console.error
		selectChat: (chat)->
			@chat = chat
			@getMessages(chat.id)
			@scrolltoBottom()
		send: ()->
			return if @text.length == 0
			@sending=true
			@api.put("messages/#{@chat.id}?message=#{@text}")
			.then ()=>
				@messages[@messages.length]= 
					body: @text
					created_at: new Date()
					sender: @api.user
				@sending=false
				@text=""
				@scrolltoBottom()
			.catch console.error
		scrolltoBottom: ()->
			setTimeout(=>
				console.log @$refs['chatBody']
				@$refs['chatBody'].scrollTop = @$refs['chatBody'].scrollHeight
			,50)
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped>
.chat-message
	&:nth-child(even)
		background: rgba(128,128,128,0.15)	
</style>