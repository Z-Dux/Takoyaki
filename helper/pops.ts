import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Interaction,
  Message,
  InteractionReplyOptions,
  MessageCreateOptions,
  InteractionCollector,
  CommandInteraction,
  ButtonInteraction,
  ComponentType,
} from "discord.js";

export class Pops {
  private target: CommandInteraction | Message;
  private payload: InteractionReplyOptions | MessageCreateOptions;
  private buttons: {
    button: ButtonBuilder;
    payload?: InteractionReplyOptions | MessageCreateOptions;
    type?: "reply" | "update";
  }[] = [];
  private message?: Message | null;

  constructor(
    target: CommandInteraction | Message,
    payload: InteractionReplyOptions | MessageCreateOptions = {}
  ) {
    this.target = target;
    this.payload = payload;
  }

  public addButton(
    button: ButtonBuilder,
    payload?: InteractionReplyOptions | MessageCreateOptions,
    type?: `reply` | `update`
  ): void {
    this.buttons.push({ button, payload, type });
  }

  private createButtons(): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      ...this.buttons.map(({ button }) => button)
    );
  }

  public async render(time: number = 60000): Promise<void> {
    const components: any =
      this.buttons.length > 0 ? [this.createButtons()] : [];

    const data = this.payload as any;
    if(!data) return;
    if (this.target instanceof CommandInteraction) {
      if (this.target.replied || this.target.deferred) {
        this.message = await this.target.editReply({
          ...data,
          components: [...components],
        });
      } else {
        this.message = (
          await this.target.reply({ ...data, components, fetchReply: true })
        ).resource?.message;
      }
    } else {
      this.message = await this.target.reply({ ...data, components });
    }

    if (!this.message) return;

    const collector: InteractionCollector<ButtonInteraction> =
      this.message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        filter: (i) =>
          i.user.id ===
          ("author" in this.target
            ? this.target.author.id
            : this.target.user.id),
        time,
      });

    collector.on("collect", async (i) => {
      const btn = this.buttons.find(
        ({ button }) => (button.data as any).custom_id === i.customId
      );
      const buttonPayload = btn?.payload;
      if (buttonPayload) {
        const data = buttonPayload as any;
        if(!data) return;
        if (btn.type == `update`) await i.update({ ...data });
        else await i.reply({ ...data });
      }
    });

    collector.on("end", async () => {
      if (this.message) {
        await this.disableBtn(this.message);
        //this.message.edit({ components: [] }).catch(() => {});
      }
    });
  }
  async disableBtn(message: Message): Promise<void> {
    const updatedComponents = message.components.map((row) => {
      const actionRow = ActionRowBuilder.from(row);

      const updatedButtons = actionRow.components.map((component) =>
        ButtonBuilder.from(component as any).setDisabled(true)
      );

      return new ActionRowBuilder<ButtonBuilder>().addComponents(
        updatedButtons
      );
    });

    await message.edit({ components: updatedComponents });
  }
}
