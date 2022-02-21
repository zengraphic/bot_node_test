class Pagination {
    defaultMessages = {
        firstPage: "❗️ That's the first page",
        lastPage: "❗️ That's the last page",
        prev: "⬅️",
        next: "➡️",
        delete: "❌"
    };

    constructor({
        data = [],
        total,
        pageSize = 10,
        rowSize = 5,
        currentPage = 1,
        onSelect = () => { },
        format = (item, index) => `${index + 1}. ${item}`,
        header = (currentPage, pageSize, total) => `Items ${(currentPage - 1) * pageSize + 1}-${currentPage * pageSize <= total ? currentPage * pageSize : total} of ${total}`,
        messages = this.defaultMessages
    }) {
        this.data = data;
        this.pageSize = pageSize;
        this.rowSize = rowSize;
        this.currentPage = currentPage;
        this.onSelect = onSelect;
        this.format = format;
        this.header = header;
        this.messages = messages
        this.total = this.lazy ? (total ?? Infinity) : this.data.length;
        this.totalPages = Math.ceil(this.total / this.pageSize);
        this.currentPage = (currentPage && (this.lazy || currentPage < this.totalPages))
            ? currentPage : 1;
        this.format = format;
        this.header = header;
        this.onSelect = onSelect;
        this.messages = Object.assign(this.defaultMessages, messages);

        this._callbackStr = Math.random().toString(36).slice(2);

        this.currentItems = [];
    }

    async text() {
        this.currentItems = getPageData(this.data, this.currentPage, this.pageSize);
        const items = this.currentItems;

        const header = this.header(this.currentPage, this.pageSize, this.total);
        const itemsText = items.map(this.format).join('\n');

        return `${header}\n${itemsText}`;
    }

    async keyboard() {
        const keyboard = [];

        this.currentItems = getPageData(this.data, this.currentPage, this.pageSize);
        const items = this.currentItems;

        let row = [];
        // Pagination buttons
        for (let i = 0; i < items.length; i++) {
            if (
                !(i % this.rowSize)
                && row.length
            ) {
                keyboard.push(row);
                row = [];
            }
            let button = getButton(
                `${i + 1}`,
                `${this._callbackStr}-${i}`
            )
            row.push(button);
        }
        keyboard.push(row);
        row = [];

        // Pagination Controls
        this.totalPages > 1 && this.currentPage > 1 ? row.push(getButton(this.messages.prev, `${this._callbackStr}-prev`)) : null ;
        row.push(getButton(this.messages.delete, `close`));
        this.totalPages > 1 ? row.push(getButton(this.messages.next, `${this._callbackStr}-next`)) : null;
        keyboard.push(row);
        // Give ready-to-use Telegra Markup object
        return {
            reply_markup: { inline_keyboard: keyboard }
        };
    }

    handleActions(composer) {
        composer.action(new RegExp(this._callbackStr + "-(.+)"), async (ctx) => {
            let data = ctx.match[1];
            let text;
            let keyboard;
            switch (data) {
                case 'prev':
                    if (this.currentPage <= 1) {
                        return await ctx.answerCbQuery(this.messages.firstPage);
                    }
                    this.currentPage = this.currentPage - 1;
                    text = await this.text();
                    keyboard = await this.keyboard();
                    await ctx.editMessageText(text, {
                        ...keyboard,
                        parse_mode: 'HTML'
                    });
                    break;
                case 'next':
                    if (this.currentPage >= this.totalPages) {
                        return await ctx.answerCbQuery(this.messages.lastPage);
                    }
                    this.currentPage = this.currentPage + 1;
                    text = await this.text();
                    keyboard = await this.keyboard();
                    await ctx.editMessageText(text, {
                        ...keyboard,
                        parse_mode: 'HTML'
                    });
                    break;
                case 'delete':
                    await ctx.deleteMessage();
                    break;
                default:
                    this.onSelect(this.currentItems[data], parseInt(data) + 1);
            };
            return await ctx.answerCbQuery();
        })
    }
};

const getPageData = (data, page, pageSize) => data.slice((page - 1) * pageSize, page * pageSize);

const getButton = (text, callback_data) => ({ text, callback_data });

module.exports = { Pagination };