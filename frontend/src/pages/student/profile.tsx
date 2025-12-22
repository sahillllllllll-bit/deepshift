import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { User, Mail, School, Phone, CreditCard, Loader2, Save, Edit, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  college: z.string().min(2, "College name is required"),
  upiId: z.string().optional(),
  phone: z.string().optional(),
});

type ProfileInput = z.infer<typeof profileSchema>;

export default function StudentProfile() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      college: user?.college || "",
      upiId: user?.upiId || "",
      phone: user?.phone || "",
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ProfileInput) => {
      const res = await apiRequest("PATCH", "/api/student/profile", data);
      const response = await res.json();
      return response;
    },
    onSuccess: (data) => {
      updateUser(data.user);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileInput) => {
    updateMutation.mutate(data);
  };

  const handleEdit = () => {
    setIsEditing(true);
    // scroll to form
    const el = document.querySelector('form');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleCancel = () => {
    form.reset({
      name: user?.name || "",
      college: user?.college || "",
      upiId: user?.upiId || "",
      phone: user?.phone || "",
    });
    setIsEditing(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account information
        </p>
      </div>

      <Card>
          <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user?.avatar || undefined} />
              <AvatarFallback className="text-2xl bg-primary/10">
                {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{user?.name}</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
              <div className="mt-1 text-sm text-muted-foreground">
                {user?.phone ? <span className="mr-4">Phone: {user?.phone}</span> : null}
                {user?.upiId ? <span>UPI: {user?.upiId}</span> : null}
              </div>
            </div>
            <div className="ml-auto">
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  <Edit className="w-4 h-4 mr-2" /> Edit
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input 
                            className="pl-10"
                            placeholder="Your full name" 
                            data-testid="input-name"
                            disabled={!isEditing}
                            {...field} 
                          />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel>Email</FormLabel>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    className="pl-10"
                    value={user?.email || ""}
                    disabled
                    data-testid="input-email"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Email cannot be changed
                </p>
              </div>

              <FormField
                control={form.control}
                name="college"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>College / School</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <School className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input 
                                className="pl-10"
                                placeholder="Your institution" 
                                data-testid="input-college"
                                disabled={!isEditing}
                                {...field} 
                              />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (Optional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          className="pl-10"
                          placeholder="Your phone number" 
                          data-testid="input-phone"
                          disabled={!isEditing}
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="upiId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>UPI ID (Optional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          className="pl-10"
                          placeholder="example@bank" 
                          data-testid="input-upi"
                          disabled={!isEditing}
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isEditing ? (
                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending}
                  data-testid="button-save"
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              ) : null}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
