'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User as UserIcon, Bell, Shield, Wallet, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { showSuccessToast, showErrorToast } from '@/lib/toast';


export default function SettingsPage() {
  const { update: updateSession } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photoSaving, setPhotoSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [profileImage, setProfileImage] = useState('');
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    targetRole: '',
    yearsOfExperience: 0,
    password: '',
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const [profileRes, notificationsRes] = await Promise.all([
          fetch('/api/user/profile'),
          fetch('/api/notifications'),
        ]);

        if (profileRes.ok) {
          const data = await profileRes.json();
          setProfileImage(data.image || '');
          setFormData({
            name: data.name || '',
            email: data.email || '',
            targetRole: data.targetRole || '',
            yearsOfExperience: data.yearsOfExperience || 0,
            password: '',
          });
        }

        if (notificationsRes.ok) {
          const data = (await notificationsRes.json()) as { notificationsEnabled?: boolean };
          setNotificationsEnabled(data.notificationsEnabled !== false);
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    
    try {
      const res = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const result = await res.json();
      
      if (res.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        showSuccessToast('Profile updated successfully!');
        await updateSession({
          user: {
            name: formData.name,
            email: formData.email,
          },
        });
      } else {
        const errMsg = result.error || 'Failed to update profile';
        setMessage({ type: 'error', text: errMsg });
        showErrorToast(errMsg);
      }
    } catch {
      const errMsg = 'An unexpected error occurred';
      setMessage({ type: 'error', text: errMsg });
      showErrorToast(errMsg);
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: id === 'yearsOfExperience' ? parseInt(value) || 0 : value
    }));
  };

  const handleNotificationToggle = async () => {
    const next = !notificationsEnabled;
    setNotificationsEnabled(next);
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationsEnabled: next }),
      });
      if (!res.ok) {
        throw new Error('Failed to update notification preference');
      }
      showSuccessToast(next ? 'Notifications enabled' : 'Notifications disabled');
    } catch {
      setNotificationsEnabled(!next);
      showErrorToast('Could not update notification preference');
    }
  };

  const uploadPhoto = async (dataUrl: string) => {
    setPhotoSaving(true);
    try {
      const res = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUrl }),
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.error || 'Failed to upload image');
      }

      const nextImage = payload.user?.image || dataUrl;
      setProfileImage(nextImage);

      await updateSession({
        user: {
          name: formData.name,
          email: formData.email,
        },
      });

      showSuccessToast('Profile photo updated');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not upload image';
      showErrorToast(msg);
    } finally {
      setPhotoSaving(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowed.includes(file.type)) {
      showErrorToast('Please upload PNG, JPG, GIF, or WEBP');
      e.target.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showErrorToast('Image must be under 2MB');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (!result) {
        showErrorToast('Could not read selected image');
        return;
      }
      await uploadPhoto(result);
      e.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = async () => {
    if (!profileImage) {
      return;
    }

    setPhotoSaving(true);
    try {
      const res = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ removeImage: true }),
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.error || 'Failed to remove image');
      }

      setProfileImage('');
      await updateSession({
        user: {
          name: formData.name,
          email: formData.email,
        },
      });
      showSuccessToast('Profile photo removed');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not remove image';
      showErrorToast(msg);
    } finally {
      setPhotoSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-[#6366F1] animate-spin" />
        <p className="text-slate-400">Loading your settings...</p>
      </div>
    );
  }

  const initials = formData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold font-space-grotesk text-white">Settings</h1>
        <p className="text-slate-400 mt-2">Manage your account preferences and global career settings.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
          message.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl mb-8">
          <TabsTrigger value="profile" className="rounded-xl px-8 data-[state=active]:bg-[#6366F1] data-[state=active]:text-white">
             <UserIcon className="w-4 h-4 mr-2" /> Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-xl px-8 data-[state=active]:bg-[#6366F1] data-[state=active]:text-white">
             <Bell className="w-4 h-4 mr-2" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="billing" className="rounded-xl px-8 data-[state=active]:bg-[#6366F1] data-[state=active]:text-white">
             <Wallet className="w-4 h-4 mr-2" /> Billing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
           <form onSubmit={handleUpdate}>
              <Card className="bg-white/5 border-white/5">
                 <CardHeader>
                    <CardTitle className="text-white">Personal Information</CardTitle>
                    <CardDescription className="text-slate-400">Update your public profile and career interests.</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-8">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                       <div className="relative group">
                          <Avatar className="h-24 w-24 border-2 border-white/10 group-hover:border-[#6366F1] transition-all">
                              <AvatarImage src={profileImage} />
                             <AvatarFallback className="bg-[#6366F1] text-white text-2xl">{initials}</AvatarFallback>
                          </Avatar>
                          <div className="absolute bottom-0 right-0 p-2 bg-[#6366F1] rounded-full border-2 border-[#111827] shadow-xl">
                             <UserIcon className="w-3 h-3 text-white" />
                          </div>
                       </div>
                       <div className="space-y-1">
                          <h4 className="text-white font-bold">Profile Photo</h4>
                          <p className="text-xs text-slate-500">JPEG, PNG, GIF, or WEBP. Max size 2MB.</p>
                          <input
                            ref={photoInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                            className="hidden"
                            onChange={(e) => void handlePhotoChange(e)}
                          />
                          <div className="flex gap-2 pt-2">
                             <Button
                               type="button"
                               size="sm"
                               variant="outline"
                               disabled={photoSaving}
                               onClick={() => photoInputRef.current?.click()}
                               className="border-white/10 text-white text-xs h-8"
                             >
                               {photoSaving ? 'Uploading...' : 'Upload'}
                             </Button>
                             <Button
                               type="button"
                               size="sm"
                               variant="ghost"
                               disabled={photoSaving || !profileImage}
                               onClick={() => void handleRemovePhoto()}
                               className="text-red-400 text-xs h-8"
                             >
                               {photoSaving ? 'Please wait...' : 'Remove'}
                             </Button>
                          </div>
                       </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <Label htmlFor="name" className="text-slate-400 text-xs uppercase font-bold tracking-widest">Full Name</Label>
                          <Input id="name" value={formData.name} onChange={handleChange} className="bg-white/5 border-white/10 text-white rounded-xl h-12 focus:border-[#6366F1]/50" />
                       </div>
                       <div className="space-y-2">
                          <Label htmlFor="email" className="text-slate-400 text-xs uppercase font-bold tracking-widest">Email Address</Label>
                          <Input id="email" value={formData.email} onChange={handleChange} className="bg-white/5 border-white/10 text-white rounded-xl h-12 focus:border-[#6366F1]/50" />
                       </div>
                       <div className="space-y-2">
                          <Label htmlFor="targetRole" className="text-slate-400 text-xs uppercase font-bold tracking-widest">Target Role</Label>
                          <Input id="targetRole" value={formData.targetRole} onChange={handleChange} placeholder="e.g. Senior Frontend Engineer" className="bg-white/5 border-white/10 text-white rounded-xl h-12 focus:border-[#6366F1]/50" />
                       </div>
                       <div className="space-y-2">
                          <Label htmlFor="yearsOfExperience" className="text-slate-400 text-xs uppercase font-bold tracking-widest">Years of Experience</Label>
                          <Input id="yearsOfExperience" type="number" value={formData.yearsOfExperience} onChange={handleChange} className="bg-white/5 border-white/10 text-white rounded-xl h-12 focus:border-[#6366F1]/50" />
                       </div>
                       <div className="space-y-2">
                          <Label htmlFor="password" title="Leave blank to keep current" className="text-slate-400 text-xs uppercase font-bold tracking-widest flex items-center gap-2">
                            New Password <span className="text-[10px] lowercase font-normal opacity-50">(optional)</span>
                          </Label>
                          <Input id="password" type="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className="bg-white/5 border-white/10 text-white rounded-xl h-12 focus:border-[#6366F1]/50" />
                       </div>
                    </div>

                    <div className="flex justify-end pt-4">
                       <Button type="submit" disabled={saving} className="bg-[#6366F1] hover:bg-[#4f52e2] text-white rounded-xl px-10 h-12 font-bold shadow-[0_0_20px_rgba(99,102,241,0.3)] disabled:opacity-50 min-w-[160px]">
                          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                          {saving ? 'Saving...' : 'Save Changes'}
                       </Button>
                    </div>
                 </CardContent>
              </Card>
           </form>

           <Card className="bg-red-500/5 border-red-500/10">
              <CardHeader>
                 <CardTitle className="text-red-400 text-lg flex items-center gap-2">
                   <Shield className="w-5 h-5" /> Danger Zone
                 </CardTitle>
                 <CardDescription className="text-slate-500 text-sm">Once you delete your account, there is no going back. Please be certain.</CardDescription>
              </CardHeader>
              <CardContent>
                 <Button 
                    onClick={async () => {
                      const confirmed = window.confirm('Are you sure you want to delete your account? This will permanently remove your account and all associated data (resumes, analyses, history). This action cannot be undone.');
                      if (!confirmed) return;
                      
                      try {
                        const res = await fetch('/api/user/delete', { method: 'DELETE' });
                        if (res.ok) {
                          showSuccessToast('Account deleted successfully. Redirecting...');
                          setTimeout(() => {
                            window.location.href = '/';
                          }, 1500);
                        } else {
                          showErrorToast('Failed to delete account. Please try again.');
                        }
                      } catch (error) {
                        showErrorToast('An error occurred while deleting your account.');
                        console.error(error);
                      }
                    }}
                    className="border-red-500/20 text-red-500 hover:bg-red-500/10 rounded-xl h-12 px-8"
                    variant="outline"
                 >
                    Delete Account
                 </Button>
              </CardContent>
           </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
           <Card className="bg-white/5 border-white/5">
              <CardHeader>
                 <CardTitle className="text-white text-lg">Notification Preferences</CardTitle>
                 <CardDescription className="text-slate-400">Control how and when you receive updates.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                 <div>
                  <p className="text-sm font-bold text-white">In-app notifications</p>
                  <p className="text-xs text-slate-400">Events: resume analyzed, suggestions ready, session saved.</p>
                 </div>
                 <Button
                  onClick={handleNotificationToggle}
                  className={notificationsEnabled ? 'bg-[#22C55E] hover:bg-[#16a34a] text-white' : 'bg-white/10 hover:bg-white/20 text-white'}
                 >
                  {notificationsEnabled ? 'Enabled' : 'Disabled'}
                 </Button>
                </div>
              </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="billing">
           <Card className="bg-white/5 border-white/5">
              <CardHeader>
                 <CardTitle className="text-white text-lg">Platform Info</CardTitle>
                 <CardDescription className="text-slate-400">All features are completely free, no upgrades needed.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 py-8">
                 <div className="space-y-3">
                    <p className="text-white font-bold">✅ Included in Free Plan:</p>
                    <ul className="space-y-2 text-slate-300 text-sm">
                       <li>• Unlimited resume analyses</li>
                       <li>• Real-time job market matching</li>
                       <li>• AI-powered career coaching</li>
                       <li>• Resume optimization suggestions</li>
                       <li>• Skill gap analysis</li>
                       <li>• Full analysis history</li>
                        <li>• Career role recommendations</li>
                    </ul>
                 </div>
              </CardContent>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
