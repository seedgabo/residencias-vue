<template lang="jade">
v-container
  v-layout(wrap='')
    v-flex(xs12='', sm12='', md6='', lg6='')
      v-card
        v-toolbar.primary(dark='')
          v-icon(dark='') insert_drive_file
          v-toolbar-title
            | {{api.trans('literals.dynamic_documents')}}
        // <v-card-text>
        v-list(two-line='')
          v-list-tile(v-for='document in documents', :key='document.id')
            v-list-tile-action(@click='selectDocument(document)')
              v-icon(:class="iconColor(document)")
                {{icon(document) }}
              
            v-list-tile-content(@click='selectDocument(document)')
              v-list-tile-title {{document.title}}
              small {{document.description}}
              small {{api.trans('literals.'+document.type)}}
            v-list-tile-action
              v-btn(small='', icon='', :href="document.url + '/api?token='+api.user.token", target='document')
                v-icon.dark--text file_download
        // </v-card-text>
    v-flex(xs12='', sm12='', md6='', lg6='')
      v-card(hover)
        pdf(ref="pdfDoc" style="width:100%;height:470px" v-if="document && document.url && document.type === 'dynamic'", :src="document.url + '/api?token='+ api.user.token")
        v-card-text(style='height:480px' v-if="document && document.url && document.type!== 'dynamic'")
          object(width="100%" height="100%", :data="document.url + '/api?token='+ api.user.token")
</template>

<script>
import pdf from 'vue-pdf'
export default {
  name: 'Documents',
  components: {
    pdf
  },
  mounted() {
    this.api.ready
      .then((data) => {
        this.getDocuments()
      })
      .catch(console.error)
  },
  data() {
    return {
      documents: [],
      document: {},
      api: require('../services/api.js'),
    }
  },
  methods: {
    getDocuments: function () {
      this.api.get('documents')
        .then((response) => {
          this.documents = response.data
          console.log(response.data)
        })
        .catch(console.error)
    },
    selectDocument: function (document) {
      this.document = document
      console.log(document)
    },
    icon: function (document) {
      if (document.type === 'dynamic' || document.type === 'pdf')
        return 'fa-file-pdf-o'
      if (document.type === 'xls' || document.type === 'xlx')
        return 'fa-file-excel-o'
      if (document.type === 'jpg' || document.type === 'png')
        return 'fa-file-image-o'
      return 'fa-file-o'
    },
    iconColor: function (document) {
      if (document.type === 'dynamic' || document.type === 'pdf')
        return 'red--text'
      if (document.type === 'xls' || document.type === 'xlx')
        return 'green--text'
      if (document.type === 'jpg' || document.type === 'png')
        return 'cyan--text'
      return 'dark--text'
    },
  }
}
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
