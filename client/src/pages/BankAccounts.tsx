import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, Building2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface BankAccount {
  id: string;
  bankName: string;
  bankNameEn: string;
  accountName: string;
  iban: string;
  accountNumber?: string;
  logo?: string;
}

export default function BankAccounts() {
  const accounts: BankAccount[] = [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-l from-primary to-teal-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <Building2 className="w-16 h-16 mx-auto mb-4 opacity-80" />
            <h1 className="text-3xl md:text-4xl font-bold font-heading">الحسابات البنكية</h1>
            <p className="mt-4 text-lg opacity-90">قنوات المساهمة تُعلن بعد اعتماد بياناتها</p>
          </div>
        </div>

        {/* Bank Accounts */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto space-y-6">
            {accounts.length === 0 ? (
              <Card className="p-6 text-center">
                <CardContent className="text-muted-foreground">
                  بيانات الحسابات البنكية لمقارئ البيان قيد التحديث. لا تحوّل أي مبالغ قبل نشر بيانات الحساب الرسمية.
                </CardContent>
              </Card>
            ) : accounts.map((account) => (
              <Card key={account.id} className="overflow-hidden hover:shadow-lg transition-shadow" data-testid={`bank-account-${account.id}`}>
                <CardHeader className="bg-gradient-to-l from-primary/5 to-teal-50 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center p-2">
                        {account.logo ? (
                          <img src={account.logo} alt={account.bankName} className="w-full h-full object-contain" />
                        ) : (
                          <Building2 className="w-8 h-8 text-primary" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-xl">{account.bankName}</CardTitle>
                        <p className="text-sm text-muted-foreground">{account.bankNameEn}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">اسم الحساب</p>
                    <p className="font-medium text-lg">{account.accountName}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">رقم الآيبان (IBAN)</p>
                    <div className="flex items-center gap-3">
                      <code className="flex-1 bg-accent/50 px-4 py-3 rounded-lg text-base font-mono tracking-wider" dir="ltr">
                        {account.iban}
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigator.clipboard.writeText(account.iban)}
                        className="shrink-0"
                        data-testid={`copy-iban-${account.id}`}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {account.accountNumber && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">رقم الحساب</p>
                      <code className="bg-accent/50 px-4 py-3 rounded-lg text-base font-mono block" dir="ltr">
                        {account.accountNumber}
                      </code>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Note */}
          <div className="max-w-3xl mx-auto mt-8">
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-6">
                <p className="text-amber-800 text-center">
                  <strong>ملاحظة:</strong> يرجى التأكد من التحويل على الحسابات الرسمية للجمعية المذكورة أعلاه فقط
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
