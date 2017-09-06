<template lang="jade">
	div(fluid="")
		v-layout(wrap="")
			v-flex(xs12 sm3)
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
			v-flex(xs12 sm9)
				v-card.mx-2.pa-2(v-if="chat")
					v-subheader.blue-grey.lighten-5
						v-avatar.blue(size="40px")
							v-icon(dark) home 
						span {{ chat.subject }}
						v-spacer
						v-btn(small flat @click="scrolltoBottom()" fab)
							v-icon arrow_downward
					v-card-text(ref="chatBody" style="height:400px;overflow:scroll;")
						v-layout.chat-message.pa-1(v-for="msg in messages")
							v-flex(xs1)
								v-avatar.mt-2(size="38px" v-if="msg.user")
									img(:src="msg.user.image_url")
							v-flex(xs9)
								p(v-if="msg.user"): b {{msg.user.name}}
									span.primary--text(v-if="msg.user.residence") &nbsp;- {{msg.user.residence.name}}
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
		@$router.app.$on 'Chat',(data)=>
			if data.thread.id == @chat?.id and data.sender.id != @api.user.id
				msg =
					user: data.sender
					body: data.message?.body
				msg.user.residence = data.residence
				@messages[@messages.length] = msg
	beforeDestroy: ()->
    	@$router.app.$off('Chat')
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
					user:
						name: @api.user.name
						image_url: @api.user.image_url
						residence:
							name: @api.residence.name
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