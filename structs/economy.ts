import { User, IUser } from "./models/user";
import { connectToDatabase } from "./database";
export class Economy {
  static async addCoins(userId: string, amount: number, name: string): Promise<IUser> {
    const user = await User.findOneAndUpdate(
      { userId, name },
      { $inc: { coins: amount } },
      { new: true, upsert: true }
    );
    return user;
  }

  static async getUserStats(userId: string): Promise<IUser | null> {
    return await User.findOne({ userId });
  }

  static async getLeaderboard(): Promise<IUser[]> {
    return await User.find().sort({ coins: -1 }).limit(10);
  }

  static async claimDaily(
    userId: string
  ): Promise<{ success: boolean; user?: IUser; message: string }> {
    const user = await User.findOne({ userId });

    const now = new Date();
    if (user && user.lastDaily) {
      const lastClaim = new Date(user.lastDaily);
      const diff = now.getTime() - lastClaim.getTime();
      const oneDay = 24 * 60 * 60 * 1000;

      if (diff < oneDay) {
        return {
          success: false,
          message: "You have already claimed your daily reward today!",
        };
      }
    }

    const updatedUser = await User.findOneAndUpdate(
      { userId },
      { $set: { lastDaily: now }, $inc: { coins: 100 } },
      { new: true, upsert: true }
    );

    return {
      success: true,
      user: updatedUser,
      message: "You have claimed your daily reward of 100 coins!",
    };
  }
}
connectToDatabase();
