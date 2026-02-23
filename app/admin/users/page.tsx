import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { AdminNav } from "@/components/admin-nav";

async function getAllUsers() {
  return await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      address: true,
      createdAt: true,
    },
  });
}

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const users = await getAllUsers();

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav />
      
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-900">All Users</h1>
          <Link href="/admin/users/new">
            <Button className="bg-pink-600 hover:bg-pink-700">
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </Link>
        </div>

        <div className="space-y-4">
          {users.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-medium text-lg">{user.name || user.email}</p>
                      <Badge
                        variant={user.role === "ADMIN" ? "default" : "secondary"}
                        className={user.role === "ADMIN" ? "bg-purple-100 text-purple-800" : ""}
                      >
                        {user.role}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500">{user.email}</p>
                    {user.phone && (
                      <p className="text-sm text-slate-500">{user.phone}</p>
                    )}
                    {user.address && (
                      <p className="text-sm text-slate-400 mt-1">{user.address}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/users/${user.id}/edit`}>
                      <Button variant="ghost" size="icon">
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </Link>
                    
                    {user.id !== session.user.id && (
                      <form
                        action={`/api/users/${user.id}`}
                        method="DELETE"
                        onSubmit={async (e) => {
                          e.preventDefault();
                          if (!confirm("Delete this user? This cannot be undone.")) return;
                          await fetch(`/api/users/${user.id}`, { method: "DELETE" });
                          window.location.reload();
                        }}
                      >
                        <Button 
                          type="submit" 
                          variant="ghost" 
                          size="icon"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </form>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {users.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-slate-500">No users found.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
