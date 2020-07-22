<template>
  <el-dialog
    :visible="value"
    :title="`title`"
    @update:visible="$emit('input', $event)"
    width="940px"
    :close-on-click-modal="false"
    class="${{className}} jqb-element-reset">
    <div class="${{className}}__header" v-if="`customTitle`" slot="title"></div>
    <jqb-form
      class="${{className}}__form"
      ref="form"
      label-width="130px"
      label-suffix="："
      :model="form">
      <jqb-row>
        <jqb-form-title :title="$t('')" />
      </jqb-row>
    </jqb-form>
    <div slot="footer" class="${{className}}__footer">
      <el-button type="secondary" @click="edit">
        {{ $t('button.edit') }}
      </el-button>
      <el-button type="secondary" @click="confirm">
        {{ $t('button.confirm') }}
      </el-button>
      <el-button @click="back">
        {{ $t('button.back') }}
      </el-button>
      <el-button @click="cancel">
        {{ $t('button.cancel') }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import {mapMutations, mapActions, mapState} from 'vuex'
import {PERMISSION_ACTION, PERMISSION_PAGE} from '@/enum/types/permissionEnums'
import {permission, confirm, validate} from '@/decorator'
import enumMixin from '@/mixins/enumMixin'
import validatorMixin from '@/mixins/validatorMixin'

export default {
  mixins: [enumMixin(...), false), validatorMixin],
  props: ['value'],
  data() {
    return {
      form: {
      },
    }
  },
  watch: {
    value(val) {
      this.init()
    },
  },
  computed: {
  },
  methods: {
    ...mapActions('', ['']),
    init() {
      this.$nextTick(() => {
        this.$refs.form.$el.parentElement.scrollTop = 0
        this.$refs.form.clearValidate()
      })
    },
    reset() {
      this.form = {
      }
    },
    @permission(PERMISSION_PAGE...., PERMISSION_ACTION.SAVE)
    edit() {    },
    @permission(PERMISSION_PAGE...., PERMISSION_ACTION.SAVE)
    @validate('form')
    async confirm() {    },
    back() {
      this.$emit('input', false)
    },
    @confirm('')
    cancel() {
      this.$emit('input', false)
    },
  },
}
</script>

<style lang="scss">
.${{className}} {
  .jqb-form {
  }
}
</style>
