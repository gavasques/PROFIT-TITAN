import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordData } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Shield, ArrowLeft, Check } from "lucide-react";

export default function ResetPassword() {
  const [, navigate] = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [token, setToken] = useState<string>("");

  // Get token from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      // If no token, redirect to forgot password
      navigate('/forgot-password');
    }
  }, [navigate]);

  const form = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: "",
      code: "",
      password: "",
    },
  });

  // Update form when token is available
  useEffect(() => {
    if (token) {
      form.setValue('token', token);
    }
  }, [token, form]);

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetPasswordData) => {
      const response = await apiRequest("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: (data) => {
      setSuccess(data.message);
      setError(null);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    },
    onError: (error: any) => {
      setError(error.message || "Erro ao alterar senha");
      setSuccess(null);
    },
  });

  const onSubmit = (data: ResetPasswordData) => {
    setError(null);
    setSuccess(null);
    resetPasswordMutation.mutate(data);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold">Senha alterada!</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Sua senha foi alterada com sucesso. Você será redirecionado para o login em alguns segundos.
              </p>
              <Button onClick={() => navigate('/login')} className="w-full">
                Ir para Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">ProfitHub</CardTitle>
          <CardDescription className="text-center">
            Digite o código recebido por email e sua nova senha
          </CardDescription>
        </CardHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="code">Código de Verificação</Label>
              <Input
                id="code"
                type="text"
                placeholder="123456"
                maxLength={6}
                className="text-center text-lg tracking-widest"
                {...form.register("code")}
                disabled={resetPasswordMutation.isPending}
              />
              {form.formState.errors.code && (
                <p className="text-sm text-red-500">{form.formState.errors.code.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Nova Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...form.register("password")}
                disabled={resetPasswordMutation.isPending}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
              )}
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
              <Shield className="h-4 w-4 inline mr-2" />
              O código é válido por 15 minutos
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={resetPasswordMutation.isPending}
            >
              {resetPasswordMutation.isPending ? "Alterando..." : "Alterar Senha"}
            </Button>
            
            <div className="flex items-center justify-center space-x-2 text-sm">
              <ArrowLeft className="h-4 w-4" />
              <Link href="/forgot-password" className="text-blue-600 hover:underline">
                Solicitar novo código
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}