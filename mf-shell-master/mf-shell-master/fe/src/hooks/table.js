import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';

export function useTable() {
  const handleDelete = async (deleteApi, options) => {
    const confirmDia = DialogPlugin.confirm({
      header: options.title,
      body: options.content,
      confirmBtn: options.confirmBtn,
      cancelBtn: options.cancelBtn,
      onConfirm: async () => {
        await deleteApi(options.data);
        await MessagePlugin.success('deleted success');
        confirmDia.destroy();
        try {
          await options.execFunc();
        } catch (err) {
          console.log(err);
        }
      },
      onClose: () => {
        confirmDia.destroy();
      },
    });
  };

  return {
    handleDelete,
  };
}
