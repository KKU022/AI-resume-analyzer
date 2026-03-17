import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, password, targetRole, yearsOfExperience, careerGoals } = await request.json();

    await connectDB();

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prepare updates
    const updates: any = {};
    if (name) updates.name = name;
    if (email && email !== user.email) {
      // Check if new email is already taken
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
      }
      updates.email = email;
    }
    
    if (password) {
      updates.password = await bcrypt.hash(password, 12);
    }

    if (targetRole !== undefined) updates.targetRole = targetRole;
    if (yearsOfExperience !== undefined) updates.yearsOfExperience = yearsOfExperience;
    if (careerGoals !== undefined) updates.careerGoals = careerGoals;

    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      { $set: updates },
      { new: true }
    );

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        targetRole: updatedUser.targetRole,
        yearsOfExperience: updatedUser.yearsOfExperience,
        careerGoals: updatedUser.careerGoals
      }
    });

  } catch (error: any) {
    console.error('User update error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
